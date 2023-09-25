export declare function login(config: any): Promise<void>;
export declare function logout(): Promise<void>;
export declare function getApps(): Promise<any>;
export declare function get(endpoint: string, searchParams: URLSearchParams): Promise<any>;
export declare function post(endpoint: string, payload: any): Promise<any>;
export declare function put(endpoint: string, payload: any): Promise<any>;
export declare function del(endpoint: string): Promise<any>;
