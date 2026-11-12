"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useSqlStore } from "@/store/useSqlStore";
import { Solver } from "@/features/study/components/Solver";

export default function SqlProblemPage() {
  const { id } = useParams();
  const { problemOrder } = useAppStore();
  const { sqlProblems, markSqlSolved, bookmarkSql, skipSql, needSqlReview, updateSqlNotes, getNextSqlProblem } = useSqlStore();
  const problem = sqlProblems.find((item) => item.id === Number(id)) ?? null;

  return (
    <Solver
      problem={problem}
      homeHref="/sql"
      problemHref={(problemId) => `/sql/problem/${problemId}`}
      notesTitle="Query Notes / Learnings"
      notesPlaceholder="Record any clever queries, edge cases, or optimizations here..."
      solvedHeading="SQL Problem Solved! 🎉"
      externalLabel={problem ? `Open in ${problem.source}` : "Open problem"}
      youtubeHref={
        problem ? `https://www.youtube.com/results?search_query=sql+${encodeURIComponent(problem.title)}` : ""
      }
      markSolved={markSqlSolved}
      bookmark={bookmarkSql}
      skip={skipSql}
      needReview={needSqlReview}
      updateNotes={updateSqlNotes}
      getNext={() => getNextSqlProblem(problemOrder)}
    />
  );
}
