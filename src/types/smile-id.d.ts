import { HTMLAttributes } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'smile-id-selfie-capture': any;
            'smile-id-document-capture': any;
            'smile-id-smart-camera-web': any;
        }
    }
}
