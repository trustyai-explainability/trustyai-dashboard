import React from 'react';
import DeleteModal from '~/app/components/DeleteModal';
import { LMEvalKind } from '~/app/types';
import { LMEvalService } from '~/app/api';

export type DeleteLMEvalModalProps = {
  lmEval: LMEvalKind;
  onClose: (deleted: boolean) => void;
};

const DeleteLMEvalModal: React.FC<DeleteLMEvalModalProps> = ({ lmEval, onClose }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const onBeforeClose = (deleted: boolean) => {
    onClose(deleted);
    setIsDeleting(false);
    setError(undefined);
  };

  const deleteName = lmEval.metadata.name;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(undefined);

    try {
      await LMEvalService.deleteEvaluation(lmEval.metadata.namespace, lmEval.metadata.name);
      onBeforeClose(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete evaluation'));
      setIsDeleting(false);
    }
  };

  return (
    <DeleteModal
      title="Delete model evaluation?"
      onClose={() => onBeforeClose(false)}
      submitButtonLabel="Delete model evaluation"
      onDelete={handleDelete}
      deleting={isDeleting}
      error={error}
      deleteName={deleteName}
    >
      This action cannot be undone.
    </DeleteModal>
  );
};

export default DeleteLMEvalModal;
