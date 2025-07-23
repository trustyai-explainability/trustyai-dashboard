package helper

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"
)

// GetEnvAsInt gets an environment variable as an integer with a default value
func GetEnvAsInt(name string, defaultVal int) int {
	if value, exists := os.LookupEnv(name); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultVal
}

// GetEnvAsString gets an environment variable as a string with a default value
func GetEnvAsString(name string, defaultVal string) string {
	if value, exists := os.LookupEnv(name); exists {
		return value
	}
	return defaultVal
}

// ParseLevel parses log level from string
func ParseLevel(s string) slog.Level {
	var level slog.Level
	err := level.UnmarshalText([]byte(s))
	if err != nil {
		panic(fmt.Errorf("invalid log level: %s, valid levels are: error, warn, info, debug", s))
	}
	return level
}

// NewOriginParser creates a new origin parser function
func NewOriginParser(allowList *[]string, defaultVal string) func(s string) error {
	return func(s string) error {
		value := defaultVal

		if s != "" {
			value = s
		}

		if value == "" {
			return nil
		}

		for _, str := range strings.Split(s, ",") {
			*allowList = append(*allowList, strings.TrimSpace(str))
		}

		return nil
	}
} 