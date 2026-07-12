export interface IStudioPlugin {
    /** The unique name of the studio. */
    name: string;
    /** Initialize and load resources for the studio. */
    install(): Promise<void>;
    /** Activate the studio (e.g. show UI, hook events). */
    activate(): Promise<void> | void;
    /** Deactivate the studio and clean up its resources. */
    deactivate(): Promise<void> | void;
}

