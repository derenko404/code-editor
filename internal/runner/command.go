package runner

import (
	"os"
	"os/exec"
	"strings"
)

const (
	relativeScriptPath = "/scripts/run.sh"
)

func escapeQuotes(input string) string {
	input = strings.ReplaceAll(input, `"`, `\"`)
	input = strings.ReplaceAll(input, `'`, `\'`)
	return input
}

func getScriptPath() (string, error) {
	cwd, err := os.Getwd()

	if err != nil {
		return "", err
	}

	return cwd + relativeScriptPath, nil
}

func getCommand(language string, code string) (*exec.Cmd, error) {
	path, err := getScriptPath()

	if err != nil {
		return nil, err
	}

	cmd := exec.Command("bash", path, escapeQuotes(code), language)

	return cmd, nil
}
