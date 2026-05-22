import Image from "next/image";
import { useState } from "react";

type section = "intro" | "overview" | "competencies" | "skills" | "action plan" | "summary" | "end";

export default function Home() {
  const [selectedSection, setSelectedSection] = useState<section>("intro");
  return (
    <>
    </>
  );
}
