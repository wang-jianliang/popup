import AgentV2 from '@src/agent/agentV2';
import AgentV1 from '@src/agent/agentV1';
import { EngineType } from '@src/engines/engine';

type Agent = AgentV1 | AgentV2;

export default Agent;

export function getPrompt(agent: Agent, inputType: string): string {
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).prompts[inputType];
    case 2:
      console.log(
        'agent',
        agent,
        'inputType',
        inputType,
        'agent.engines',
        (agent as AgentV2).engines,
        'agent.engines[inputType]',
        (agent as AgentV2).engines[inputType],
      );
      return (agent as AgentV2).engines[inputType].prompt;
    default:
      throw new Error('Unknown schema version');
  }
}

export function getSystemPrompt(agent: Agent, inputType: string): string | undefined {
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).systemPrompt;
    case 2:
      return (agent as AgentV2).engines[inputType].systemPrompt;
    default:
      throw new Error('Unknown schema version');
  }
}

export function getContextTypes(agent: Agent): string[] {
  switch (agent.schemaVersion) {
    case 1:
      return Object.keys((agent as AgentV1).prompts);
    case 2:
      return Object.keys((agent as AgentV2).engines);
    default:
      throw new Error('Unknown schema version');
  }
}

export function getEngineType(agent: Agent, inputType: string): EngineType {
  console.log('getEngineType', agent, inputType);
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).engine;
    case 2:
      return (agent as AgentV2).engines[inputType].type;
    default:
      throw new Error('Unknown schema version');
  }
}

export function getEngineModel(agent: Agent, inputType: string): string {
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).models[0];
    case 2:
      return (agent as AgentV2).engines[inputType].model;
    default:
      throw new Error('Unknown schema version');
  }
}
