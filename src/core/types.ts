export type FrontendChoice = "none" | "vue" | "react" | "angular" | "next";
export type CiChoice = "none" | "github" | "bitbucket";
export type DbProvider = "sqlserver";
export type SolutionFormat = "sln" | "slnx";

export interface CreateOptions {
  projectName: string;
  outputDir: string;
  frontend: FrontendChoice;
  dbProvider: DbProvider;
  auth: boolean;
  ci: CiChoice;
  sampleFeature: boolean;
  skipInstall: boolean;
  solutionFormat: SolutionFormat;
  migrate: boolean;
  updateDatabase: boolean;
}

/** Flat string->string map consumed by the Eta renderer and path-token resolver. */
export type TokenMap = Record<string, string>;

export interface CleanArchConfig {
  $schema?: string;
  cliVersion: string;
  createdWith: string;
  projectName: string;
  rootNamespace: string;
  options: {
    frontend: FrontendChoice;
    dbProvider: DbProvider;
    auth: boolean;
    ci: CiChoice;
    solutionFormat: SolutionFormat;
  };
  layers: {
    domain: string;
    application: string;
    infrastructure: string;
    api: string;
    tests: string;
    web?: string;
  };
}
