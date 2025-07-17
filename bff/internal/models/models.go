package models

// ModelOption represents an available model for evaluation
type ModelOption struct {
	Value       string `json:"value"`
	Label       string `json:"label"`
	DisplayName string `json:"displayName"`
	Namespace   string `json:"namespace"`
	Service     string `json:"service"`
}
