export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseUrl}/functions/v1/${endpoint}`;
  
  const { headers: optHeaders, ...restOptions } = options;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_CONFIG.anonKey || '',
      ...(optHeaders as Record<string, string>),
    },
    ...restOptions,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Leaderboard API
export const leaderboardAPI = {
  async getLeaderboard(type = 'checkin', limit = 10) {
    return apiCall(`leaderboard?type=${type}&limit=${limit}`);
  }
};

// Community Q&A API
export const communityQAAPI = {
  async list(limit = 5) {
    return apiCall('community-qa', {
      method: 'POST',
      body: JSON.stringify({
        action: 'list',
        limit
      })
    });
  },
  
  async create(data: any) {
    return apiCall('community-qa', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...data
      })
    });
  },

  async answer(questionId: string, answer: string) {
    return apiCall('community-qa', {
      method: 'POST',
      body: JSON.stringify({
        action: 'answer',
        question_id: questionId,
        answer
      })
    });
  }
};

// Prompt Market API
export const promptMarketAPI = {
  async list(page = 1, limit = 12) {
    return apiCall('prompt-market', {
      method: 'POST',
      body: JSON.stringify({
        action: 'list',
        page,
        limit
      })
    });
  },

  async detail(templateId: string) {
    return apiCall('prompt-market', {
      method: 'POST',
      body: JSON.stringify({
        action: 'detail',
        template_id: templateId
      })
    });
  },

  async submit(data: any) {
    return apiCall('prompt-market', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit',
        ...data
      })
    });
  },

  async purchase(templateId: string) {
    return apiCall('prompt-market', {
      method: 'POST',
      body: JSON.stringify({
        action: 'purchase',
        template_id: templateId
      })
    });
  }
};

// User Profile API
export const userProfileAPI = {
  async getProfile(token: string) {
    return apiCall('user-profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  async updateProfile(token: string, data: any) {
    return apiCall('user-profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  }
};

// Invite System API
export const inviteSystemAPI = {
  async getStats(userId: string) {
    return apiCall('invite-system', {
      method: 'POST',
      body: JSON.stringify({
        action: 'stats',
        user_id: userId
      })
    });
  },

  async generate(userId: string) {
    return apiCall('invite-system', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate',
        user_id: userId
      })
    });
  },

  async getInviteCode(userId: string) {
    return apiCall('invite-system', {
      method: 'POST',
      body: JSON.stringify({
        action: 'get_code',
        user_id: userId
      })
    });
  }
};

// Achievement API
export const achievementAPI = {
  async list(userId: string) {
    return apiCall('achievement-unlock', {
      method: 'POST',
      body: JSON.stringify({
        action: 'list',
        user_id: userId
      })
    });
  },

  async unlock(userId: string, achievementId: string) {
    return apiCall('achievement-unlock', {
      method: 'POST',
      body: JSON.stringify({
        action: 'unlock',
        user_id: userId,
        achievement_id: achievementId
      })
    });
  }
};

// Charity API
export const charityAPI = {
  async donate(token: string, projectId: string, amount: number) {
    return apiCall('charity-donate', { method: 'POST', body: JSON.stringify({ action: 'donate', user_id: token, project_id: projectId, amount }) });
  },
  async history(userId: string) {
    return apiCall('charity-donate', { method: 'POST', body: JSON.stringify({ action: 'history', user_id: userId }) });
  },
  async listProjects() {
    return apiCall('charity-project', { method: 'POST', body: JSON.stringify({ action: 'list' }) });
  },
  async projectDetail(projectId: string) {
    return apiCall('charity-project', { method: 'POST', body: JSON.stringify({ action: 'detail', project_id: projectId }) });
  }
};

// Tool Review API
export const toolReviewAPI = {
  async submit(token: string, toolId: string, rating: number, content: string) {
    return apiCall('tool-review', { method: 'POST', body: JSON.stringify({ action: 'submit', token, tool_id: toolId, rating, content }) });
  }
};

// Governance API
export const governanceAPI = {
  async listProposals() {
    return apiCall('governance-vote', { method: 'POST', body: JSON.stringify({ action: 'list' }) });
  },
  async vote(token: string, proposalId: string, choice: string) {
    return apiCall('governance-vote', { method: 'POST', body: JSON.stringify({ action: 'vote', token, proposal_id: proposalId, choice }) });
  },
  async proposalDetail(proposalId: string) {
    return apiCall('governance-vote', { method: 'POST', body: JSON.stringify({ action: 'detail', proposal_id: proposalId }) });
  }
};

// AI Reward API
export const aiRewardAPI = {
  async score(token: string) {
    return apiCall('ai-reward', { method: 'POST', body: JSON.stringify({ action: 'score', ai_id: token }) });
  },
  async history(token: string) {
    return apiCall('ai-reward', { method: 'POST', body: JSON.stringify({ action: 'history', ai_id: token }) });
  }
};

// Content Submit API (for teach page)
export const contentSubmitAPI = {
  async submit(data: any) {
    return apiCall('content-submit', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit',
        ...data
      })
    });
  },

  async list(userId?: string) {
    return apiCall('content-submit', {
      method: 'POST',
      body: JSON.stringify({
        action: 'list',
        user_id: userId
      })
    });
  }
};

// Checkin API
export const checkinAPI = {
  async checkin(token: string, answer?: string) {
    return apiCall('mining-checkin', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ answer: answer || '' }) });
  },
  async getQuestion(token: string) {
    return apiCall('mining-checkin', { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
  },
  async status(token: string) {
    return apiCall('mining-checkin', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ action: 'status' }) });
  },
  async streak(userId: string) {
    return apiCall(`mining-streak-simple?user_id=${userId}`);
  }
};

// Mining Learn API
export const miningLearnAPI = {
  async complete(token: string, courseId: string) {
    return apiCall('mining-learn', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ lessonId: courseId, timeSpent: 30 }) });
  }
};

// Quiz API
export const quizAPI = {
  async getQuiz(courseId: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiCall('quiz-system', { method: 'POST', headers, body: JSON.stringify({ action: 'get-quiz', course_id: courseId }) });
  },
  async submitQuiz(token: string, courseId: string, answers: number[]) {
    return apiCall('quiz-system', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ action: 'submit', course_id: courseId, answers }) });
  }
};

// Mining Use API
export const miningUseAPI = {
  async record(userId: string, toolName: string, inputText: string, outputText: string) {
    return apiCall('mining-use', { method: 'POST', body: JSON.stringify({ action: 'record', user_id: userId, tool_name: toolName, input_text: inputText, output_text: outputText }) });
  },
  async history(userId: string) {
    return apiCall('mining-use', { method: 'POST', body: JSON.stringify({ action: 'history', user_id: userId }) });
  }
};
// Startup Project API (创业加速器)
export const startupAPI = {
  async list(status?: string, category?: string) {
    return apiCall('startup-project', {
      method: 'POST',
      body: JSON.stringify({ action: 'list', status, category })
    });
  },
  async submit(data: { user_id: string; name: string; description: string; category?: string; team_size?: number; website?: string }) {
    return apiCall('startup-project', {
      method: 'POST',
      body: JSON.stringify({ action: 'submit', ...data })
    });
  },
  async detail(projectId: string) {
    return apiCall('startup-project', {
      method: 'POST',
      body: JSON.stringify({ action: 'detail', project_id: projectId })
    });
  },
  async myProjects(userId: string) {
    return apiCall('startup-project', {
      method: 'POST',
      body: JSON.stringify({ action: 'my-projects', user_id: userId })
    });
  }
};
