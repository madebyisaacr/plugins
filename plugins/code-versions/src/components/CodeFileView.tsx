import type { CodeFileVersionsState } from "../hooks/useCodeFileVersions"
import { LoadingState, useCanRestoreVersion } from "../hooks/useCodeFileVersions"
import FileDiff from "./FileDiff"
import VersionsSidebar from "./VersionsSidebar"

interface CodeFileViewProps {
    state: CodeFileVersionsState["state"]
    selectVersion: CodeFileVersionsState["selectVersion"]
    restoreVersion: CodeFileVersionsState["restoreVersion"]
}

export default function CodeFileView({ state, selectVersion, restoreVersion }: CodeFileViewProps) {
    const currentContent = state.codeFile?.content

    const isCurrentVersion = state.codeFile?.versionId === state.selectedVersionId
    const canRestoreVersion = useCanRestoreVersion()

    return (
        <div className="grid grid-cols-[var(--width-versions)_1fr] grid-rows-[1fr_auto] h-screen bg-bg-base text-text-base">
            <VersionsSidebar
                className="row-span-2"
                versions={state.versions}
                selectedId={state.selectedVersionId}
                onSelect={selectVersion}
                isLoading={state.versionsLoading === LoadingState.Initial}
            />
            <div className="bg-bg-secondary overflow-hidden relative">
                {state.contentLoading === LoadingState.Initial ? null : (
                    <FileDiff original={state.versionContent ?? ""} revised={currentContent ?? ""} />
                )}
            </div>
            {!isCurrentVersion && canRestoreVersion ? (
                <button
                    className="px-6 py-2 rounded bg-tint text-black font-semibold hover:bg-tint-dark transition disabled:opacity-50 disabled:cursor-not-allowed m-3 w-full"
                    onClick={restoreVersion}
                    disabled={state.restoreLoading === LoadingState.Initial}
                >
                    {state.restoreLoading === LoadingState.Initial ? "Restoring…" : "Restore"}
                </button>
            ) : null}
        </div>
    )
}
