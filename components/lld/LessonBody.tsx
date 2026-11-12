import type { LldLesson } from "@/data/lld/types";
import { LessonHeader } from "./LessonHeader";
import { VersionBlock } from "./VersionBlock";

export function LessonBody({ lesson }: { lesson: LldLesson }) {
  return (
    <article className="space-y-5">
      <LessonHeader
        title={lesson.title}
        tagline={lesson.tagline}
        explanation={lesson.explanation}
        whenToUse={lesson.whenToUse}
        whenNot={lesson.whenNot}
      />
      <div className="space-y-4">
        {lesson.versions.map((version) => (
          <VersionBlock key={`${lesson.slug}-${version.label}`} version={version} />
        ))}
      </div>
    </article>
  );
}
