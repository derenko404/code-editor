package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/code-editor/internal/runner"
	"github.com/lxzan/gws"
)

var Upgrader = gws.NewUpgrader(&handler{}, &gws.ServerOption{
	ParallelEnabled:   true,
	Recovery:          gws.Recovery,
	PermessageDeflate: gws.PermessageDeflate{Enabled: true},
})

func Handler(writer http.ResponseWriter, request *http.Request) {
	socket, err := Upgrader.Upgrade(writer, request)

	if err != nil {
		return
	}
	go func() {
		socket.ReadLoop()
	}()
}

const (
	CodeRun  = "code:run"
	CodeStop = "code:stop"
)

type Request struct {
	Name    string                 `json:"name"`
	Payload map[string]interface{} `json:"payload"`
}

type Reply struct {
	Source  string `json:"source"`
	Payload string `json:"payload"`
}

var ctx context.Context
var cancel context.CancelFunc

func router(socket *gws.Conn, message *gws.Message) {
	var request *Request

	if err := json.Unmarshal(message.Bytes(), &request); err != nil {
		socket.WriteMessage(message.Opcode, []byte("error"))
	}

	switch request.Name {
	case CodeRun:
		language, isLanguageExists := request.Payload["language"].(string)
		code, isCodeExiss := request.Payload["code"].(string)

		if isLanguageExists && isCodeExiss {
			runner := &runner.CodeRunner{
				Language: language,
				Code:     code,
				OnStream: func(output *runner.CodeRunnerOutput) {
					reply := &Reply{
						Source:  output.Source,
						Payload: output.Line,
					}

					replyAsBytes, err := json.Marshal(reply)

					if err != nil {
						fmt.Println(err)
					}

					socket.WriteMessage(gws.OpcodeText, []byte(replyAsBytes))
				},
				OnCompleted: func() {
					reply := &Reply{
						Source:  runner.SourceServer,
						Payload: "DONE",
					}

					replyAsBytes, err := json.Marshal(reply)

					if err != nil {
						fmt.Println(err)
					}

					socket.WriteMessage(gws.OpcodeText, replyAsBytes)
				},
			}

			ctx, cancel = context.WithCancel(context.Background())
			runner.Run(ctx)
		}
	case CodeStop:
		cancel()

		reply := &Reply{
			Source:  runner.SourceServer,
			Payload: "TERMINATED",
		}

		replyAsBytes, err := json.Marshal(reply)

		if err != nil {
			fmt.Println(err)
		}

		socket.WriteMessage(gws.OpcodeText, replyAsBytes)
	default:
		break
	}
}

type handler struct {
	gws.BuiltinEventHandler
}

func (c *handler) OnMessage(socket *gws.Conn, message *gws.Message) {
	defer message.Close()

	router(socket, message)
}
