export declare function generateSampleDataPipe(name: string, selectedApp: String): {
    name: string;
    description: null;
    type: string;
    inputNode: {
        _id: string;
        name: string;
        type: string;
    };
    app: String;
    nodes: never[];
};
export declare function buildDependencyMatrixForDataPipe(datapipes: any[]): any;
export declare function parseDataPipeAndFixAppName(input: any, appName: string): any;
export declare function parseAndFixDataPipes(datapipes: any[]): any[];
