import AgentV2 from '@src/agent/agentV2';
import AgentV1 from '@src/agent/agentV1';
import { EngineType } from '@src/engines/engine';

type Agent = AgentV1 | AgentV2;

export default Agent;

export function getEngineType(agent: Agent, inputType: string): EngineType {
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).engine;
    case 2:
      return (agent as AgentV2).engine[inputType].type;
    default:
      throw new Error('Unknown schema version');
  }
}

export function getEngineModel(agent: Agent, inputType: string): string {
  switch (agent.schemaVersion) {
    case 1:
      return (agent as AgentV1).models[0];
    case 2:
      return (agent as AgentV2).engine[inputType].model;
    default:
      throw new Error('Unknown schema version');
  }
}
