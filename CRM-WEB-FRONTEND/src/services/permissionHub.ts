import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from "@microsoft/signalr";
import { authService } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7076/api";
const SIGNALR_HUB_URL = API_BASE_URL.replace(/\/api\/?$/i, "") + "/permissionHub";

const HUB_EVENTS = {
  permissionChanged: "PermissionChanged",
  userStatusChanged: "UserStatusChanged",
} as const;

export type PermissionChangedPayload = {
  userId: number;
  action: string;
};

export type UserStatusChangedPayload = {
  userId: number;
  isActive: boolean;
};

type PermissionChangedHandler = (payload: PermissionChangedPayload) => void;
type UserStatusChangedHandler = (payload: UserStatusChangedPayload) => void;

let connection: HubConnection | null = null;
let connectionPromise: Promise<void> | null = null;
let isHubUnavailable = false;
const permissionChangedHandlers = new Set<PermissionChangedHandler>();
const userStatusChangedHandlers = new Set<UserStatusChangedHandler>();

function isConnected(hub: HubConnection | null): boolean {
  return hub?.state === HubConnectionState.Connected;
}

function buildConnection(): HubConnection {
  const builder = new HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: () => authService.getAccessToken() ?? "",
      transport: import.meta.env.DEV ? HttpTransportType.ServerSentEvents : undefined,
    })
    .configureLogging(LogLevel.None);

  if (!import.meta.env.DEV) {
    builder.withAutomaticReconnect([0, 2000, 10000, 30000]);
  }

  return builder.build();
}

function emitPermissionChanged(payload: PermissionChangedPayload): void {
  permissionChangedHandlers.forEach((handler) => {
    try {
      handler(payload);
    } catch (error) {
      console.warn("PermissionHub: permission handler failed", error);
    }
  });
}

function emitUserStatusChanged(payload: UserStatusChangedPayload): void {
  userStatusChangedHandlers.forEach((handler) => {
    try {
      handler(payload);
    } catch (error) {
      console.warn("PermissionHub: user status handler failed", error);
    }
  });
}

function attachHandlers(hub: HubConnection): void {
  hub.on(HUB_EVENTS.permissionChanged, (payload: PermissionChangedPayload) => {
    emitPermissionChanged(payload);
  });

  hub.on(HUB_EVENTS.userStatusChanged, (payload: UserStatusChangedPayload) => {
    emitUserStatusChanged(payload);
  });

  hub.onreconnecting((error) => {
    if (import.meta.env.DEV) {
      console.info("PermissionHub: reconnecting", error?.message ?? "");
    }
  });

  hub.onreconnected((connectionId) => {
    isHubUnavailable = false;
    if (import.meta.env.DEV) {
      console.info("PermissionHub: reconnected", connectionId ?? "");
    }
  });

  hub.onclose(() => {
    connection = null;
    connectionPromise = null;
  });
}

async function startConnection(): Promise<void> {
  connection = buildConnection();
  attachHandlers(connection);
  await connection.start();
}

export const permissionHubService = {
  async start(): Promise<boolean> {
    if (import.meta.env.DEV) {
      isHubUnavailable = true;
      return false;
    }

    if (!authService.isAuthenticated() || !authService.getAccessToken()) {
      return false;
    }

    if (isHubUnavailable) {
      return false;
    }

    if (connection?.state === HubConnectionState.Connected || connection?.state === HubConnectionState.Connecting || connection?.state === HubConnectionState.Reconnecting) {
      return true;
    }

    if (connectionPromise) {
      await connectionPromise;
      return isConnected(connection);
    }

    connectionPromise = startConnection()
      .catch((error) => {
        isHubUnavailable = true;
        void connection?.stop().catch(() => {});
        connection = null;
        if (import.meta.env.DEV) {
          console.info("PermissionHub: realtime no disponible, la aplicacion continuara sin websocket.");
        }
        void error;
      })
      .finally(() => {
        connectionPromise = null;
      });

    await connectionPromise;
    return isConnected(connection);
  },

  async stop(): Promise<void> {
    if (!connection) {
      return;
    }

    try {
      await connection.stop();
    } catch {
      // ignore
    } finally {
      connection = null;
      connectionPromise = null;
    }
  },

  onPermissionChanged(handler: PermissionChangedHandler): () => void {
    permissionChangedHandlers.add(handler);

    return () => {
      permissionChangedHandlers.delete(handler);
    };
  },

  onUserStatusChanged(handler: UserStatusChangedHandler): () => void {
    userStatusChangedHandlers.add(handler);

    return () => {
      userStatusChangedHandlers.delete(handler);
    };
  },
};
