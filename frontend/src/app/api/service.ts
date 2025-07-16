import { LMEvalKind } from '~/app/types';
import { k8sApi, LMEvalCreateRequest } from './k8s';

// Service layer for business logic and data transformation
export class LMEvalService {
  /**
   * Get all evaluations for a namespace
   */
  static async getEvaluations(namespace?: string): Promise<LMEvalKind[]> {
    const response = await k8sApi.listLMEvals(namespace);
    return response.data.items;
  }

  /**
   * Get a specific evaluation by name and namespace
   */
  static async getEvaluation(namespace: string, name: string): Promise<LMEvalKind | null> {
    const response = await k8sApi.getLMEval(namespace, name);
    return response.data;
  }

  /**
   * Create a new evaluation
   */
  static async createEvaluation(namespace: string, data: LMEvalCreateRequest): Promise<LMEvalKind> {
    const response = await k8sApi.createLMEval(namespace, data);
    return response.data;
  }

  /**
   * Update an existing evaluation
   */
  static async updateEvaluation(
    namespace: string,
    name: string,
    data: LMEvalKind,
  ): Promise<LMEvalKind> {
    const response = await k8sApi.updateLMEval(namespace, name, data);
    return response.data;
  }

  /**
   * Delete an evaluation
   */
  static async deleteEvaluation(namespace: string, name: string): Promise<void> {
    await k8sApi.deleteLMEval(namespace, name);
  }

  /**
   * Get evaluations filtered by status
   */
  static async getEvaluationsByStatus(namespace: string, status: string): Promise<LMEvalKind[]> {
    const evaluations = await this.getEvaluations(namespace);
    return evaluations.filter((evaluation) => evaluation.status?.state === status);
  }

  /**
   * Get running evaluations
   */
  static async getRunningEvaluations(namespace: string): Promise<LMEvalKind[]> {
    return this.getEvaluationsByStatus(namespace, 'Running');
  }

  /**
   * Get completed evaluations
   */
  static async getCompletedEvaluations(namespace: string): Promise<LMEvalKind[]> {
    return this.getEvaluationsByStatus(namespace, 'Complete');
  }

  /**
   * Get failed evaluations
   */
  static async getFailedEvaluations(namespace: string): Promise<LMEvalKind[]> {
    return this.getEvaluationsByStatus(namespace, 'Failed');
  }
}

export class NamespaceService {
  /**
   * Get all accessible namespaces
   */
  static async getNamespaces(): Promise<string[]> {
    const response = await k8sApi.getNamespaces();
    return response.data.map((ns) => ns.name);
  }

  /**
   * Check if a namespace exists and is accessible
   */
  static async isNamespaceAccessible(namespace: string): Promise<boolean> {
    try {
      const namespaces = await this.getNamespaces();
      return namespaces.includes(namespace);
    } catch {
      return false;
    }
  }
}

export class UserService {
  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<{ userID: string; clusterAdmin: boolean } | null> {
    const response = await k8sApi.getUser();
    return response.data;
  }

  /**
   * Check if current user is cluster admin
   */
  static async isClusterAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.clusterAdmin || false;
    } catch {
      return false;
    }
  }
}

// Export default service instances
export const lmEvalService = LMEvalService;
export const namespaceService = NamespaceService;
export const userService = UserService;

export default {
  lmEval: LMEvalService,
  namespace: NamespaceService,
  user: UserService,
};
