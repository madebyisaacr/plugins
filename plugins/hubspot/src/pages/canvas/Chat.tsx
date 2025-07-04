import { framer, useIsAllowedTo } from "framer-plugin"
import { useEffect, useState } from "react"
import { Link } from "wouter"
import { useAccountQuery, useInboxesQuery } from "../../api"
import { CenteredSpinner } from "../../components/CenteredSpinner"
import { SegmentedControls } from "../../components/SegmentedControls"

interface Settings {
    enableWidgetCookieBanner: string
    disableAttachment: string
}

export default function ChatPage() {
    const [hasSetExistingSettings, setHasSetExistingSettings] = useState(false)
    const [settings, setSettings] = useState<Settings>({
        enableWidgetCookieBanner: "false",
        disableAttachment: "false",
    })
    const { data: account, isLoading: isLoadingAccount } = useAccountQuery()
    const { data: inboxes, isLoading: isLoadingInboxes } = useInboxesQuery()

    const isAllowedToSetCustomCode = useIsAllowedTo("setCustomCode")

    useEffect(() => {
        async function checkExistingSettings() {
            const customCode = await framer.getCustomCode()
            const existingHTML = customCode?.bodyStart.html

            const matches = (existingHTML ?? "").match(/window\.hsConversationsSettings\s*=\s*(\{.*?\});/)
            if (matches && matches[1]) {
                const { enableWidgetCookieBanner, disableAttachment } = JSON.parse(matches[1])
                setSettings({
                    enableWidgetCookieBanner: enableWidgetCookieBanner.toString(),
                    disableAttachment: disableAttachment.toString(),
                })
            }

            setHasSetExistingSettings(true)
        }

        checkExistingSettings()
    }, [])

    useEffect(() => {
        if (!isAllowedToSetCustomCode) return

        async function applySettings() {
            const customCode = await framer.getCustomCode()
            const existingHTML = customCode?.bodyStart.html

            if (!hasSetExistingSettings || existingHTML === undefined) return

            const { enableWidgetCookieBanner, disableAttachment } = settings
            const chatSettings = {
                disableAttachment: disableAttachment === "true",
                enableWidgetCookieBanner:
                    enableWidgetCookieBanner === "true"
                        ? true
                        : enableWidgetCookieBanner === "ON_EXIT_INTENT"
                          ? "ON_EXIT_INTENT"
                          : false,
            }
            const settingsScript = `<script>window.hsConversationsSettings = ${JSON.stringify(chatSettings)};</script>`

            if (!existingHTML?.includes(settingsScript)) {
                await framer.setCustomCode({
                    html: settingsScript,
                    location: "bodyStart",
                })
            }
        }

        applySettings()
    }, [settings, hasSetExistingSettings, isAllowedToSetCustomCode])

    if (isLoadingAccount || isLoadingInboxes) return <CenteredSpinner />

    if (!account || !inboxes) return null

    return (
        <main>
            <p>
                Ensure
                <Link to="/canvas/tracking"> tracking </Link>
                is enabled.
            </p>
            <h6>Inboxes</h6>
            {inboxes.length > 0 ? (
                inboxes.map((inbox, i) => (
                    <div className="input-container" key={i}>
                        <span>{inbox.name}</span>
                        <a
                            target="_blank"
                            title={inbox.name}
                            href={`https://app.hubspot.com/live-messages-settings/${account.portalId}/inboxes/${inbox.id}/edit/live-chat/primary/configure`}
                        >
                            Open
                        </a>
                    </div>
                ))
            ) : (
                <p className="text-tertiary text-center max-w-[200px] m-auto">
                    Create an inbox in HubSpot to view it here
                </p>
            )}
            <hr />
            <h6>Settings</h6>
            <div className="input-container">
                <label htmlFor="enableWidgetCookieBanner">Banner</label>
                <select
                    name="enableWidgetCookieBanner"
                    id="enableWidgetCookieBanner"
                    value={settings.enableWidgetCookieBanner}
                    onChange={value => setSettings({ ...settings, enableWidgetCookieBanner: value.target.value })}
                    disabled={!isAllowedToSetCustomCode}
                    title={isAllowedToSetCustomCode ? undefined : "Insufficient permissions"}
                    className={isAllowedToSetCustomCode ? undefined : "opacity-50"}
                >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                    <option value="ON_EXIT_INTENT">On Exit Intent</option>
                </select>
            </div>
            <div className="input-container">
                <label htmlFor="disableAttachment">Attachment</label>
                <SegmentedControls
                    name="disableAttachment"
                    options={[
                        { value: "false", label: "Show" },
                        { value: "true", label: "Hide" },
                    ]}
                    value={settings.disableAttachment}
                    onValueChange={value => setSettings({ ...settings, disableAttachment: value })}
                    disabled={!isAllowedToSetCustomCode}
                    title={isAllowedToSetCustomCode ? undefined : "Insufficient permissions"}
                />
            </div>
            <hr />
            <button
                className="framer-button-primary w-full"
                onClick={() => {
                    window.open(`https://app-eu1.hubspot.com/chatflows/${account.portalId}/`, "_blank")
                }}
            >
                View Chatflows
            </button>
        </main>
    )
}
