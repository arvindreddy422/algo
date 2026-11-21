import "@excalidraw/excalidraw/index.css";
import { WhiteboardFrame } from "@/components/WhiteboardFrame";

export const metadata = {
  title: "Whiteboard | DSA Coach",
  description: "Freeform drawing canvas powered by Excalidraw.",
};

export default function WhiteboardPage() {
  return <WhiteboardFrame />;
}
