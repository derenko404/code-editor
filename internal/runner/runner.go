package runner

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"sync"
)

const (
	SourceServer = "server"
	SourceStdout = "stdout"
	SourceStderr = "stderr"
)

type CodeRunner struct {
	Language    string
	Code        string
	OnStream    func(chunk *CodeRunnerOutput)
	OnCompleted func()
}

type CodeRunnerOutput struct {
	Source string
	Line   string
}

func scanStd(wg *sync.WaitGroup, ch chan string, scanner *bufio.Scanner) {
	defer wg.Done()

	for scanner.Scan() {
		ch <- scanner.Text()
	}

	if err := scanner.Err(); err != nil {
		fmt.Printf("Error reading %v\n", err)
	}
}

func streamCommandOutput(ctx context.Context, cmd *exec.Cmd, channel chan *CodeRunnerOutput) {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println("Error creating StdoutPipe:", err)
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		fmt.Println("Error creating StderrPipe:", err)
		return
	}

	err = cmd.Start()
	if err != nil {
		fmt.Println("Error starting command:", err)
		return
	}

	var wg sync.WaitGroup
	wg.Add(2)

	stdoutCh := make(chan string)
	stderrCh := make(chan string)

	stdoutScanner := bufio.NewScanner(stdout)
	stderrScanner := bufio.NewScanner(stderr)

	go func() {
		scanStd(&wg, stdoutCh, stdoutScanner)
		close(stdoutCh)
	}()

	go func() {
		scanStd(&wg, stderrCh, stderrScanner)
		close(stderrCh)
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case line, ok := <-stdoutCh:
			if !ok {
				stdoutCh = nil
			} else {
				output := &CodeRunnerOutput{
					Source: SourceStdout,
					Line:   line,
				}

				channel <- output
			}

		case line, ok := <-stderrCh:
			if !ok {
				stderrCh = nil
			} else {
				message := &CodeRunnerOutput{
					Source: SourceStderr,
					Line:   line,
				}
				channel <- message
			}
		}

		if stdoutCh == nil && stderrCh == nil {
			break
		}
	}
}

func runCode(ctx context.Context, channel chan *CodeRunnerOutput, language, code string) {
	cmd, err := getCommand(language, code)

	if err != nil {
		fmt.Println("Error getting command:", err)
		return
	}

	streamCommandOutput(ctx, cmd, channel)
}

func (runner *CodeRunner) Run(ctx context.Context) {
	streamCh := make(chan *CodeRunnerOutput)

	go func() {
		runCode(ctx, streamCh, runner.Language, runner.Code)
		close(streamCh)

		runner.OnCompleted()
	}()

	for chunk := range streamCh {
		runner.OnStream(chunk)
	}
}
