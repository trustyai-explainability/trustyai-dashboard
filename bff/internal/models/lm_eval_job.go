package models

import (
	"time"
)

// LMEvalJobKind represents a model evaluation job resource
type LMEvalJobKind struct {
	APIVersion string            `json:"apiVersion"`
	Kind       string            `json:"kind"`
	Metadata   LMEvalJobMetadata `json:"metadata"`
	Spec       LMEvalJobSpec     `json:"spec"`
	Status     *LMEvalJobStatus  `json:"status,omitempty"`
}

// LMEvalJobMetadata contains metadata for the evaluation job
type LMEvalJobMetadata struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	Annotations       map[string]string `json:"annotations,omitempty"`
	ResourceVersion   string            `json:"resourceVersion,omitempty"`
	UID               string            `json:"uid,omitempty"`
	CreationTimestamp time.Time         `json:"creationTimestamp,omitempty"`
}

// LMEvalJobSpec contains the specification for the evaluation job
type LMEvalJobSpec struct {
	AllowCodeExecution bool                `json:"allowCodeExecution,omitempty"`
	AllowOnline        bool                `json:"allowOnline,omitempty"`
	BatchSize          string              `json:"batchSize,omitempty"`
	LogSamples         bool                `json:"logSamples,omitempty"`
	Model              string              `json:"model"`
	ModelArgs          []LMEvalJobModelArg `json:"modelArgs,omitempty"`
	Timeout            int                 `json:"timeout,omitempty"`
	TaskList           LMEvalJobTaskList   `json:"taskList"`
	Outputs            *LMEvalJobOutputs   `json:"outputs,omitempty"`
}

// LMEvalJobModelArg represents a model argument
type LMEvalJobModelArg struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// LMEvalJobTaskList contains the list of tasks to evaluate
type LMEvalJobTaskList struct {
	TaskNames []string `json:"taskNames"`
}

// LMEvalJobOutputs contains output configuration
type LMEvalJobOutputs struct {
	PVCManaged *LMEvalJobPVCManaged `json:"pvcManaged,omitempty"`
}

// LMEvalJobPVCManaged contains PVC configuration
type LMEvalJobPVCManaged struct {
	Size string `json:"size"`
}

// LMEvalJobStatus contains the current status of the evaluation job
type LMEvalJobStatus struct {
	CompleteTime     *time.Time             `json:"completeTime,omitempty"`
	LastScheduleTime *time.Time             `json:"lastScheduleTime,omitempty"`
	Message          string                 `json:"message,omitempty"`
	PodName          string                 `json:"podName,omitempty"`
	Reason           string                 `json:"reason,omitempty"`
	Results          string                 `json:"results,omitempty"`
	State            string                 `json:"state,omitempty"`
	ProgressBars     []LMEvalJobProgressBar `json:"progressBars,omitempty"`
}

// LMEvalJobProgressBar represents a progress bar in the status
type LMEvalJobProgressBar struct {
	Count                 string `json:"count"`
	ElapsedTime           string `json:"elapsedTime"`
	Message               string `json:"message"`
	Percent               string `json:"percent"`
	RemainingTimeEstimate string `json:"remainingTimeEstimate"`
}

// LMEvalJobList represents a list of LMEvalJob resources
type LMEvalJobList struct {
	APIVersion string          `json:"apiVersion"`
	Kind       string          `json:"kind"`
	Metadata   ListMetadata    `json:"metadata"`
	Items      []LMEvalJobKind `json:"items"`
}

// LMEvalJobCreateRequest represents a request to create a new evaluation job
type LMEvalJobCreateRequest struct {
	EvaluationName  string               `json:"evaluationName"`
	K8sName         string               `json:"k8sName"`
	ModelType       string               `json:"modelType"`
	Model           LMEvalJobModelConfig `json:"model"`
	Tasks           []string             `json:"tasks"`
	AllowRemoteCode bool                 `json:"allowRemoteCode"`
	AllowOnline     bool                 `json:"allowOnline"`
	BatchSize       string               `json:"batchSize,omitempty"`
}

// LMEvalJobModelConfig represents model configuration
type LMEvalJobModelConfig struct {
	Name             string `json:"name"`
	URL              string `json:"url"`
	TokenizedRequest string `json:"tokenizedRequest"`
	Tokenizer        string `json:"tokenizer"`
}
