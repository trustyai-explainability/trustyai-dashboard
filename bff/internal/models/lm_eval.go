package models

import (
	"time"
)

// LMEvalKind represents a model evaluation resource
type LMEvalKind struct {
	APIVersion string         `json:"apiVersion"`
	Kind       string         `json:"kind"`
	Metadata   LMEvalMetadata `json:"metadata"`
	Spec       LMEvalSpec     `json:"spec"`
	Status     *LMEvalStatus  `json:"status,omitempty"`
}

// LMEvalMetadata contains metadata for the evaluation
type LMEvalMetadata struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	Annotations       map[string]string `json:"annotations,omitempty"`
	ResourceVersion   string            `json:"resourceVersion,omitempty"`
	UID               string            `json:"uid,omitempty"`
	CreationTimestamp time.Time         `json:"creationTimestamp,omitempty"`
}

// LMEvalSpec contains the specification for the evaluation
type LMEvalSpec struct {
	AllowCodeExecution bool             `json:"allowCodeExecution,omitempty"`
	AllowOnline        bool             `json:"allowOnline,omitempty"`
	BatchSize          string           `json:"batchSize,omitempty"`
	LogSamples         bool             `json:"logSamples,omitempty"`
	Model              string           `json:"model"`
	ModelArgs          []LMEvalModelArg `json:"modelArgs,omitempty"`
	Timeout            int              `json:"timeout,omitempty"`
	TaskList           LMEvalTaskList   `json:"taskList"`
	Outputs            *LMEvalOutputs   `json:"outputs,omitempty"`
}

// LMEvalModelArg represents a model argument
type LMEvalModelArg struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// LMEvalTaskList contains the list of tasks to evaluate
type LMEvalTaskList struct {
	TaskNames []string `json:"taskNames"`
}

// LMEvalOutputs contains output configuration
type LMEvalOutputs struct {
	PVCManaged *LMEvalPVCManaged `json:"pvcManaged,omitempty"`
}

// LMEvalPVCManaged contains PVC configuration
type LMEvalPVCManaged struct {
	Size string `json:"size"`
}

// LMEvalStatus contains the current status of the evaluation
type LMEvalStatus struct {
	CompleteTime     *time.Time          `json:"completeTime,omitempty"`
	LastScheduleTime *time.Time          `json:"lastScheduleTime,omitempty"`
	Message          string              `json:"message,omitempty"`
	PodName          string              `json:"podName,omitempty"`
	Reason           string              `json:"reason,omitempty"`
	Results          string              `json:"results,omitempty"`
	State            string              `json:"state,omitempty"`
	ProgressBars     []LMEvalProgressBar `json:"progressBars,omitempty"`
}

// LMEvalProgressBar represents a progress bar in the status
type LMEvalProgressBar struct {
	Count                 string `json:"count"`
	ElapsedTime           string `json:"elapsedTime"`
	Message               string `json:"message"`
	Percent               string `json:"percent"`
	RemainingTimeEstimate string `json:"remainingTimeEstimate"`
}

// LMEvalList represents a list of LMEval resources
type LMEvalList struct {
	APIVersion string       `json:"apiVersion"`
	Kind       string       `json:"kind"`
	Metadata   ListMetadata `json:"metadata"`
	Items      []LMEvalKind `json:"items"`
}

// ListMetadata contains metadata for list responses
type ListMetadata struct {
	ResourceVersion string `json:"resourceVersion,omitempty"`
}

// LMEvalCreateRequest represents a request to create a new evaluation
type LMEvalCreateRequest struct {
	EvaluationName  string            `json:"evaluationName"`
	K8sName         string            `json:"k8sName"`
	ModelType       string            `json:"modelType"`
	Model           LMEvalModelConfig `json:"model"`
	Tasks           []string          `json:"tasks"`
	AllowRemoteCode bool              `json:"allowRemoteCode"`
	AllowOnline     bool              `json:"allowOnline"`
	BatchSize       string            `json:"batchSize,omitempty"`
}

// LMEvalModelConfig represents model configuration
type LMEvalModelConfig struct {
	Name             string `json:"name"`
	URL              string `json:"url"`
	TokenizedRequest string `json:"tokenizedRequest"`
	Tokenizer        string `json:"tokenizer"`
}
