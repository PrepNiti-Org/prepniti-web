import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExamWorkspace } from "../app/mock-tests/_components/ExamWorkspace";
import { Paper, ExamElement } from "../app/mock-tests/_components/types";

// Mock toast and UI components
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock custom Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

describe("ExamWorkspace Component", () => {
  const mockPaper: Paper = {
    id: "paper-1",
    filename: "chemistry_mock.pdf",
    uploaded_at: "2026-06-16T21:18:55Z",
    q_count: 2,
    exam_type: "Practice",
    duration: 120,
  };

  const mockBlueprint: ExamElement[] = [
    {
      is_passage: false,
      questions: [
        {
          id: "q-1",
          question_text: "What is the molecular formula of benzene?",
          type: "MCQ",
          options: [
            { id: "opt-1", option_text: "C6H6", is_correct: true },
            { id: "opt-2", option_text: "CH4", is_correct: false },
          ],
        },
      ],
    },
    {
      is_passage: true,
      passage_text: "Refer to this passage to answer.",
      passage_image_url: "/uploads/passage_diagram.png",
      questions: [
        {
          id: "q-2",
          question_text: "Answer according to passage details.",
          type: "MCQ",
          image_url: "/uploads/question_diagram.png",
          options: [],
        },
      ],
    },
  ];

  it("should render mock question text and options successfully", () => {
    const setAnswers = vi.fn();
    const setQuestionStatuses = vi.fn();
    const setCurrentQuestionIndex = vi.fn();

    render(
      <ExamWorkspace
        selectedPaper={mockPaper}
        timeRemaining={7200}
        blueprint={mockBlueprint}
        answers={{}}
        setAnswers={setAnswers}
        currentQuestionIndex={0}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        questionStatuses={{ "q-1": "not_visited" }}
        setQuestionStatuses={setQuestionStatuses}
        onSubmit={vi.fn()}
      />
    );

    // Expect question text is rendered
    expect(screen.getByText(/What is the molecular formula of benzene/)).toBeInTheDocument();
    // Expect option items are rendered
    expect(screen.getByText("C6H6")).toBeInTheDocument();
    expect(screen.getByText("CH4")).toBeInTheDocument();
  });

  it("should handle option selection calls", () => {
    const setAnswers = vi.fn();

    render(
      <ExamWorkspace
        selectedPaper={mockPaper}
        timeRemaining={7200}
        blueprint={mockBlueprint}
        answers={{}}
        setAnswers={setAnswers}
        currentQuestionIndex={0}
        setCurrentQuestionIndex={vi.fn()}
        questionStatuses={{ "q-1": "not_visited" }}
        setQuestionStatuses={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Click option choice
    fireEvent.click(screen.getByText("C6H6"));
    expect(setAnswers).toHaveBeenCalled();
  });

  it("should render image illustrations correctly when provided", () => {
    const setAnswers = vi.fn();

    // Render 2nd question (index 1) which is a passage question with image_url
    render(
      <ExamWorkspace
        selectedPaper={mockPaper}
        timeRemaining={7200}
        blueprint={mockBlueprint}
        answers={{}}
        setAnswers={setAnswers}
        currentQuestionIndex={1}
        setCurrentQuestionIndex={vi.fn()}
        questionStatuses={{ "q-2": "not_visited" }}
        setQuestionStatuses={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Verify passage text is rendered
    expect(screen.getByText("Refer to this passage to answer.")).toBeInTheDocument();

    // Verify passage image is rendered
    const images = screen.getAllByRole("img");
    const imageSources = images.map((img) => img.getAttribute("src"));

    expect(imageSources).toContain("http://localhost:8080/uploads/passage_diagram.png");
    expect(imageSources).toContain("http://localhost:8080/uploads/question_diagram.png");
  });
});
