interface flag {
  name: string;
  description: string;
  requiresValue: boolean;
}

export interface Command {
  [action: string]: {
    description: string;
    usage: string;
    category: string;
    flags: flag[];
    execute: (args: Record<string, string>) => void;
  };
}
