import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';
// eslint-disable-next-line import/no-extraneous-dependencies
import ApplicationsPage from 'mod-arch-shared/dist/components/ApplicationsPage';
import { downloadString } from '~/app/utils/string';
import LMEvalResultTable from './LMEvalResultTable';
import { parseEvaluationResults } from './utils';
import useLMEvalResult from './useLMEvalResult';

const LMEvalResult: React.FC = () => {
  const { evaluationName } = useParams<{ evaluationName: string }>();
  const lmEvalResult = useLMEvalResult(evaluationName);
  const evaluation = lmEvalResult.data;
  const results = React.useMemo(
    () => (evaluation?.status?.results ? parseEvaluationResults(evaluation.status.results) : []),
    [evaluation?.status?.results],
  );

  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbItem render={() => <Link to="/">Model evaluations runs</Link>} />
      <BreadcrumbItem isActive>{evaluation?.metadata.name || evaluationName}</BreadcrumbItem>
    </Breadcrumb>
  );

  const handleDownload = React.useCallback(() => {
    if (evaluation?.status?.results) {
      try {
        const resultsObject = JSON.parse(evaluation.status.results);
        const rawData = JSON.stringify(resultsObject, null, 2);
        downloadString(`${evaluation.metadata.name}-results.json`, rawData);
      } catch {
        downloadString(`${evaluation.metadata.name}-results.txt`, evaluation.status.results);
      }
    }
  }, [evaluation]);

  const isEmpty = lmEvalResult.loaded && (!evaluation || results.length === 0);

  const getEmptyMessage = () => {
    if (lmEvalResult.loaded && !evaluation) {
      return `Evaluation "${evaluationName || 'Unknown'}" not found`;
    }
    if (evaluation && results.length === 0) {
      return evaluation.status?.results
        ? 'Unable to parse evaluation results'
        : 'Evaluation results not yet available';
    }
    return undefined;
  };

  return (
    <ApplicationsPage
      loaded={lmEvalResult.loaded}
      empty={isEmpty}
      loadError={lmEvalResult.error}
      title={evaluation?.metadata.name || evaluationName || 'Evaluation Results'}
      breadcrumb={breadcrumb}
      emptyMessage={getEmptyMessage()}
      headerAction={
        evaluation && (
          <Button variant="primary" onClick={handleDownload}>
            Download JSON
          </Button>
        )
      }
      provideChildrenPadding
    >
      {evaluation && <LMEvalResultTable results={results} />}
    </ApplicationsPage>
  );
};

export default LMEvalResult;
