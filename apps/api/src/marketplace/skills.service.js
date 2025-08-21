const { AiGovernanceDefaults } = require('../../../../packages/core/src/index.js');

function registerSkill(appId, name, tokenCap) { if (tokenCap<=0) throw new Error('token cap'); return { appId, name, tokenCap, confirmCard:true, regulatedSubmit:false }; }

function enforceSkillCall(skill, tokensRequested) { if (tokensRequested>skill.tokenCap) throw new Error('token cap exceeded'); return true; }

module.exports = { registerSkill, enforceSkillCall };
