import React from 'react';
import DeleteModal from '~/app/components/DeleteModal';
import { LMEvalKind } from '~/app/types';

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

  return (
    <DeleteModal
      title="Delete model evaluation?"
      onClose={() => onBeforeClose(false)}
      submitButtonLabel="Delete model evaluation"
      onDelete={() => {
        setIsDeleting(true);

        /* TODO: Implement delete model evaluation */
      }}
      deleting={isDeleting}
      error={error}
      deleteName={deleteName}
    >
      This action cannot be undone.
    </DeleteModal>
  );
};

export default DeleteLMEvalModal;
