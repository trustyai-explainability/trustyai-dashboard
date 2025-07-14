import Table from 'mod-arch-shared/dist/components/table/Table';
import * as React from 'react';
import DashboardEmptyTableView from 'mod-arch-shared/dist/components/DashboardEmptyTableView';
import { LMEvalKind } from '~/app/types';
import { columns } from './const';
import LMEvalTableRow from './LMEvalTableRow';
import DeleteLMEvalModal from './DeleteLMEvalModal';

type LMEvalTableProps = {
  lmEval: LMEvalKind[];
  clearFilters?: () => void;
  onClearFilters: () => void;
} & Partial<Pick<React.ComponentProps<typeof Table>, 'enablePagination' | 'toolbarContent'>>;

const LMEvalTable: React.FC<LMEvalTableProps> = ({
  lmEval,
  clearFilters,
  onClearFilters,
  toolbarContent,
}) => {
  const [deleteLMEval, setDeleteLMEval] = React.useState<LMEvalKind>();
  return (
    <>
      <Table
        data-testid="lm-eval-table"
        id="lm-eval-table"
        enablePagination
        data={lmEval}
        columns={columns}
        onClearFilters={onClearFilters}
        toolbarContent={toolbarContent}
        emptyTableView={
          clearFilters ? <DashboardEmptyTableView onClearFilters={clearFilters} /> : undefined
        }
        rowRenderer={(cr) => (
          <LMEvalTableRow
            key={cr.metadata.uid}
            lmEval={cr}
            onDeleteLMEval={(i) => setDeleteLMEval(i)}
          />
        )}
      />

      {deleteLMEval ? (
        <DeleteLMEvalModal
          lmEval={deleteLMEval}
          onClose={() => {
            setDeleteLMEval(undefined);
          }}
        />
      ) : null}
    </>
  );
};
export default LMEvalTable;
