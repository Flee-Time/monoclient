type FrameWindowAction = "CLOSE" | "MAXIMIXE" | "MINIMIZE";

type NewMessageNotificationPayload = {
  title: string;
  body: string;
  icon: string;
  sameRoom: boolean;
};

type UpdateStatusCallback = (message: string) => void;
type DownloadProgressCallback = (progressObj: { percent: number }) => void;

type EventPayloadMapping = {
  sendFrameAction: FrameWindowAction;
  sendNotification: NewMessageNotificationPayload;
  updateStatus: string;
  downloadProgress: { percent: number };
  rendererInitialized: null;
};

interface Window {
  electron: {
    sendFrameAction: (payload: FrameWindowAction) => void;
    sendNotification: (payload: NewMessageNotificationPayload) => void;
    onUpdateStatus: (callback: UpdateStatusCallback) => () => void;
    onDownloadProgress: (callback: DownloadProgressCallback) => () => void;
    sendRendererInitialized: () => void;
  };
}
