import { LMEvalService, NamespaceService } from '~/app/api/service';
import { k8sApi } from '~/app/api/k8s';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Kubernetes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('k8sApi', () => {
    it('should get namespaces', async () => {
      const mockResponse = { data: [{ name: 'project-1' }, { name: 'project-2' }] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await k8sApi.getNamespaces();
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/namespaces',
        expect.objectContaining({
          headers: expect.objectContaining({
            'kubeflow-userid': 'test-user@example.com',
          }),
        }),
      );
    });

    it('should list LMEvals', async () => {
      const mockResponse = {
        data: {
          apiVersion: 'trustyai.opendatahub.io/v1alpha1',
          kind: 'LMEvalList',
          items: [],
        },
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await k8sApi.listLMEvals('test-namespace');
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/evaluations?namespace=test-namespace',
        expect.any(Object),
      );
    });
  });

  describe('LMEvalService', () => {
    it('should get evaluations', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              metadata: { name: 'eval-1', namespace: 'test' },
              spec: { model: 'test-model', taskList: { taskNames: ['test'] } },
            },
          ],
        },
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await LMEvalService.getEvaluations('test-namespace');
      expect(result).toEqual(mockResponse.data.items);
    });
  });

  describe('NamespaceService', () => {
    it('should get namespaces', async () => {
      const mockResponse = { data: [{ name: 'project-1' }, { name: 'project-2' }] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NamespaceService.getNamespaces();
      expect(result).toEqual(['project-1', 'project-2']);
    });
  });
});
