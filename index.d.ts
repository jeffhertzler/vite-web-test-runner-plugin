declare function _exports(opts?: {
    skipVite?: (url: string) => boolean;
}): Promise<import("@web/test-runner").TestRunnerPlugin<any>>;
export = _exports;
