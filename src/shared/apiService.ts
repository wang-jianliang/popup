import ApiClient from '@pages/common/apiClient';
import { API_BASE_URL } from '@src/constants';

const apiClient = new ApiClient({
  baseURL: `${API_BASE_URL}/api`,
});

export default apiClient;
