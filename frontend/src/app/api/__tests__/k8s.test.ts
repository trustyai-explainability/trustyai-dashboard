import { LMEvalService, NamespaceService } from '~/app/api/service';
import { k8sApi } from '~/app/api/k8s';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Kubernetes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('k8sApi', () => {
    it('should get namespaces', async () => {
      const mockResponse = { data: [{ name: 'project-1' }, { name: 'project-2' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await k8sApi.getNamespaces();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/namespaces',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await k8sApi.listLMEvals('test-namespace');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/evaluations?namespace=test-namespace',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
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
      mockFetch.mockResolvedValueOnce({
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NamespaceService.getNamespaces();
      expect(result).toEqual(['project-1', 'project-2']);
    });
  });
});
