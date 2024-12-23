import { createContext, useContext, useState, ReactNode } from 'react';

type ServerContextType = {
  serverUrl: string;
  setServerUrl: (url: string) => void;
};

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider = ({ children }: { children: ReactNode }) => {
  const [serverUrl, setServerUrl] = useState<string>("https://cyberia.sfg.quest:8081");

  return (
    <ServerContext.Provider value={{ serverUrl, setServerUrl }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error("useServer must be used within a ServerProvider");
  }
  return context;
};
