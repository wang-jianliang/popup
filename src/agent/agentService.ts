import Agent from '@src/agent/agent';
import * as AgentWhatIs from '@src/agent/what_is.json';
import * as AgentChat from '@src/agent/chat.json';
import * as AgentTranslate from '@src/agent/translate.json';
import * as AgentSummarize from '@src/agent/summarize.json';
import * as AgentContextualSearch from '@src/agent/contextual_search.json';
import * as AgentReferenceCheck from '@src/agent/reference_check.json';
import * as AgentFactCheck from '@src/agent/fact_check.json';
import * as AgentSentimentAnalysis from '@src/agent/sentiment_analysis.json';
import * as AgentImageAnalysis from '@src/agent/image_analysis.json';
import * as AgentKeywordExtraction from '@src/agent/keyword_extraction.json';
import * as AgentTopicIdentification from '@src/agent/topic_identification.json';
import * as AgentTextSimplification from '@src/agent/text_simplification.json';
import * as AgentCitationGenerator from '@src/agent/citation_generator.json';
import * as AgentPlagiarismCheck from '@src/agent/plagiarism_check.json';
import * as AgentContentRating from '@src/agent/content_rating.json';

export function fetchAgents(offset: number, pageSize: number): Promise<Map<string, Agent>> {
  return new Promise(resolve => {
    // const agents = new Map([
    //   ['what_is', AgentWhatIs as Agent],
    //   ['chat', AgentChat as Agent],
    // ]);

    const agents = new Map([
      ['what_is', AgentWhatIs as Agent], // Explains the selected content
      ['chat', AgentChat as Agent], // Engages in a conversation about the selected content
      ['translate', AgentTranslate as Agent], // Translates the selected content to another language
      ['summarize', AgentSummarize as Agent], // Provides a summary of the selected content
      ['contextual_search', AgentContextualSearch as Agent], // Searches for more information based on the selected content
      ['reference_check', AgentReferenceCheck as Agent], // Checks the references or sources of the selected content
      ['fact_check', AgentFactCheck as Agent], // Checks the accuracy of the facts in the selected content
      ['sentiment_analysis', AgentSentimentAnalysis as Agent], // Analyzes the sentiment of the selected content
      ['image_analysis', AgentImageAnalysis as Agent], // Analyzes any selected images and provides information about them
      ['keyword_extraction', AgentKeywordExtraction as Agent], // Extracts and provides the keywords from the selected content
      ['topic_identification', AgentTopicIdentification as Agent], // Identifies and provides the main topics of the selected content
      ['text_simplification', AgentTextSimplification as Agent], // Simplifies the selected content to make it easier to understand
      ['citation_generator', AgentCitationGenerator as Agent], // Generates a citation for the selected content
      ['plagiarism_check', AgentPlagiarismCheck as Agent], // Checks the selected content for plagiarism
      ['content_rating', AgentContentRating as Agent], // Rates the quality of the selected content
    ]);

    for (let i = 0; i < pageSize; i++) {
      agents.set(`what_is_${i + offset * pageSize}`, AgentWhatIs as Agent);
    }
    resolve(agents);
  });
}
