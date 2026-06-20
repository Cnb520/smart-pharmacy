declare module 'sql.js' {
  interface SqlJsStatic {
    Database: { new (buffer?: ArrayLike<number> | Buffer | null): Database };
  }

  interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): void;
    bind(params: any[]): boolean;
    step(): boolean;
    get(): any;
    getAsObject(): Record<string, any>;
    getAll(): any[];
    getColumnNames(): string[];
    getAsObject(params?: any[]): Record<string, any>;
    getAllAsObject(params?: any[]): Record<string, any>[];
    free(): void;
    reset(): void;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
    wasmBinary?: ArrayBuffer;
  }): Promise<SqlJsStatic>;

  export { SqlJsStatic, Database };
}
