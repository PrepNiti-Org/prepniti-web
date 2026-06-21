import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExamWorkspace } from "../app/mock-tests/_components/ExamWorkspace";
import { Paper, ExamElement } from "../app/mock-tests/_components/types";
import { evaluateExpression } from "../app/mock-tests/_components/VirtualCalculator";

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
    // Click Save & Next to commit the draft answer
    fireEvent.click(screen.getByRole("button", { name: /Save & Next/i }));
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

  it("should show confirmation modal when clicking submit and trigger onSubmit only upon confirmation", () => {
    const onSubmit = vi.fn();
    render(
      <ExamWorkspace
        selectedPaper={mockPaper}
        timeRemaining={7200}
        blueprint={mockBlueprint}
        answers={{}}
        setAnswers={vi.fn()}
        currentQuestionIndex={0}
        setCurrentQuestionIndex={vi.fn()}
        questionStatuses={{ "q-1": "not_visited", "q-2": "not_visited" }}
        setQuestionStatuses={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    // Initial state: onSubmit has not been called, and warning is not in document
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText("Exam Submission Confirmation")).not.toBeInTheDocument();

    // Click "Submit Exam" button
    fireEvent.click(screen.getByRole("button", { name: /Submit Exam/i }));

    // Modal should be visible
    expect(screen.getByText("Exam Submission Confirmation")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to submit the exam now/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Click "No, Return to Test" to close modal
    fireEvent.click(screen.getByRole("button", { name: /No, Return to Test/i }));
    expect(screen.queryByText("Exam Submission Confirmation")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Click "Submit Exam" again
    fireEvent.click(screen.getByRole("button", { name: /Submit Exam/i }));
    expect(screen.getByText("Exam Submission Confirmation")).toBeInTheDocument();

    // Click "Yes, Submit Exam" to submit
    fireEvent.click(screen.getByRole("button", { name: /Yes, Submit Exam/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Exam Submission Confirmation")).not.toBeInTheDocument();
  });

  it("should render and work correctly under modern theme mode (useRealisticTheme={false})", () => {
    const onSubmit = vi.fn();
    render(
      <ExamWorkspace
        selectedPaper={mockPaper}
        timeRemaining={7200}
        blueprint={mockBlueprint}
        answers={{}}
        setAnswers={vi.fn()}
        currentQuestionIndex={0}
        setCurrentQuestionIndex={vi.fn()}
        questionStatuses={{ "q-1": "not_visited" }}
        setQuestionStatuses={vi.fn()}
        onSubmit={onSubmit}
        useRealisticTheme={false}
      />
    );

    // Verify option selector is rendered
    expect(screen.getByText("C6H6")).toBeInTheDocument();

    // Verify submit button is rendered
    const submitBtn = screen.getByRole("button", { name: /Submit Exam/i });
    expect(submitBtn).toBeInTheDocument();

    // Click submit button to trigger modal
    fireEvent.click(submitBtn);
    expect(screen.getByText("Exam Submission Confirmation")).toBeInTheDocument();
  });

  describe("Scientific Calculator Parser", () => {
    it("should evaluate basic mathematical operations with correct precedence", () => {
      expect(evaluateExpression("2 + 3 * 4")).toBe(14);
      expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
      expect(evaluateExpression("10 / 2 - 1")).toBe(4);
    });

    it("should evaluate scientific functions (trig, log, power, factorial, mod)", () => {
      expect(evaluateExpression("sin(pi / 2)")).toBe(1);
      expect(evaluateExpression("cos(0)")).toBe(1);
      expect(evaluateExpression("2 ^ 3")).toBe(8);
      expect(evaluateExpression("4!")).toBe(24);
      expect(evaluateExpression("10 mod 3")).toBe(1);
      expect(evaluateExpression("sqrt(16)")).toBe(4);
    });

    it("should throw domain or syntax error on invalid mathematical inputs", () => {
      expect(() => evaluateExpression("sqrt(-1)")).toThrow(/negative square root/i);
      expect(() => evaluateExpression("5 / 0")).toThrow(/divide by zero/i);
      expect(() => evaluateExpression("2 + * 3")).toThrow(/invalid token/i);
    });
  });

  describe("Sectional Mock Tests", () => {
    const sectionalBlueprint: ExamElement[] = [
      {
        is_passage: false,
        questions: [
          {
            id: "q-sec-1",
            question_text: "Physics Question",
            type: "MCQ",
            topic: "Physics",
            options: [],
          },
        ],
      },
      {
        is_passage: false,
        questions: [
          {
            id: "q-sec-2",
            question_text: "Chemistry Question",
            type: "MCQ",
            topic: "Chemistry",
            options: [],
          },
        ],
      },
    ];

    it("should render section tabs when multiple topics are present", () => {
      render(
        <ExamWorkspace
          selectedPaper={mockPaper}
          timeRemaining={7200}
          blueprint={sectionalBlueprint}
          answers={{}}
          setAnswers={vi.fn()}
          currentQuestionIndex={0}
          setCurrentQuestionIndex={vi.fn()}
          questionStatuses={{ "q-sec-1": "not_visited", "q-sec-2": "not_visited" }}
          setQuestionStatuses={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      // Section tabs should render
      expect(screen.getByText("Physics")).toBeInTheDocument();
      expect(screen.getByText("Chemistry")).toBeInTheDocument();
    });

    it("should jump to the first question of a section when clicking its tab", () => {
      const setCurrentQuestionIndex = vi.fn();
      render(
        <ExamWorkspace
          selectedPaper={mockPaper}
          timeRemaining={7200}
          blueprint={sectionalBlueprint}
          answers={{}}
          setAnswers={vi.fn()}
          currentQuestionIndex={0}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          questionStatuses={{ "q-sec-1": "not_visited", "q-sec-2": "not_visited" }}
          setQuestionStatuses={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      // Click Chemistry tab
      fireEvent.click(screen.getByText("Chemistry"));
      
      // Should jump to index 1 (the chemistry question index)
      expect(setCurrentQuestionIndex).toHaveBeenCalledWith(1);
    });
  });
});
