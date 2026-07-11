export interface IShowcase {
    load(): Promise<void> | void;
    unload(): void;
}
