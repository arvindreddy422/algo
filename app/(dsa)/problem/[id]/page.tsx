"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Solver } from "@/features/study/components/Solver";

export default function ProblemPage() {
  const { id } = useParams();
  const { problems, markSolved, bookmark, skip, needReview, updateNotes, getNextProblem } = useAppStore();
  const problem = problems.find((item) => item.id === Number(id)) ?? null;

  return (
    <Solver
      problem={problem}
      homeHref="/"
      problemHref={(problemId) => `/problem/${problemId}`}
      notesTitle="Personal Notes"
      notesPlaceholder="Record your mistakes, optimal solutions, time/space complexity here..."
      solvedHeading="Problem Solved! 🎉"
      externalLabel="Open in LeetCode"
      youtubeHref={
        problem
          ? `https://www.youtube.com/results?search_query=leetcode+${problem.id}+${encodeURIComponent(problem.title)}`
          : ""
      }
      markSolved={markSolved}
      bookmark={bookmark}
      skip={skip}
      needReview={needReview}
      updateNotes={updateNotes}
      getNext={getNextProblem}
    />
  );
}
