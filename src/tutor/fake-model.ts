import { TutorModel, TutorModelResult, TutorMoveInput } from '../contracts';

const FAKE_MODEL_METADATA = {
  modelIdentifier: 'fake-tutor',
  promptTemplateVersion: 'fake-tutor-prompt-1',
  latencyMs: 0,
  tokenUsage: { input: 0, output: 0, total: 0 },
};

export class FakeTutorModel implements TutorModel {
  async generateMove(input: TutorMoveInput): Promise<TutorModelResult> {
    const moveType = input.authorization.allowedMoveTypes[0];
    const assistanceLevel = input.authorization.maximumAssistance;
    const messages: Record<string, [string, string]> = {
      clarify_problem: [
        'Let’s make sure we understand the question first.',
        'What is the problem asking you to find?',
      ],
      probe_reasoning: [
        'Show me the first relationship or step you notice.',
        'What do you already know?',
      ],
      hint_1_strategy: [
        'Look for the relationship between the two quantities.',
        'What stays the same as both quantities change?',
      ],
      hint_2_representation: [
        'Try organizing the quantities in a table, diagram, or equation.',
        'Which representation makes the relationship easier to see?',
      ],
      hint_3_subproblem: [
        'Choose one smaller part of the problem to work on first.',
        'What could you calculate or compare before solving the whole problem?',
      ],
      analogous_example: [
        'Think of a simpler situation with the same relationship.',
        'How would the simpler situation guide your next step?',
      ],
      guided_solution: [
        'Let’s work through the permitted solution one step at a time.',
        'What does this step tell you about the original question?',
      ],
      explain_and_reflect: [
        'Explain the strategy in your own words.',
        'How would you recognize this kind of relationship next time?',
      ],
    };
    const [learnerMessage, question] = messages[moveType] ?? messages.probe_reasoning;
    return {
      candidate: {
        moveType,
        learnerMessage,
        question,
        assistanceLevel,
        expectedResponseForm: 'explanation',
        safetyFlags: ['none'],
        confidence: 0.5,
      },
      metadata: FAKE_MODEL_METADATA,
    };
  }

  async scoreConstructedResponse(): Promise<TutorModelResult> {
    return {
      candidate: {
        correctness: 'unscored',
        rationale: 'The fake model does not establish mastery evidence.',
        confidence: 0,
      },
      metadata: FAKE_MODEL_METADATA,
    };
  }
}
