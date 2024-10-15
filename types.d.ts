type FrameWindowAction = 'CLOSE' | 'MAXIMIXE' | 'MINIMIZE';

type EventPayloadMapping = {
    sendFrameAction: FrameWindowAction;
}

interface Window {
    electron: {
        sendFrameAction: (payload: FrameWindowAction) => void;
    }
}