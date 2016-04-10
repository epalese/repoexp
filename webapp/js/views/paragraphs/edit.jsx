"use strict";

import React        from 'react';
import { History }  from 'react-router';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import marked       from 'marked';
import NotebookStore    from 'appRoot/stores/notebooks';
// import Chart        from 'react-d3-core';
// import LineChart    from 'react-d3-basic';

export default React.createClass({
    mixins: [
        Reflux.ListenerMixin
    ],

    getInitialState: function() {
        return {paragraphs: this.props.paragraphs};
    },
    componentWillMount: function() {
        this.listenTo(Actions.sendMsgWS.completed, function(paragraphId, msg) {
            if (paragraphId == this.state.paragraphs.id) {
                console.log("actions.sendWS completed");
                console.log(msg);
                // this.setState({ notebook: notebook, loading: false });
                // update the paragraph to notify that the message has been sent
                // and we are waiting for an anwer
            }
        });
        this.listenTo(Actions.receiveMsgWS, function(paragraphId, response) {
            if (paragraphId == this.state.paragraphs.id) {
                console.log("actions.receiveMsgWS: ");
                console.log(response);
                this.setState({paragraphs: response});
            }
        });
        this.editMode = this.props.hasOwnProperty('paragraphId');
        if (this.editMode) {
            // check the paragraph type and process the output
            // in case of react type
            var p = this.state.paragraphs;
            if (this.state.paragraphs.type == 'react') {
                var checked_output;
                try {
                    checked_output = eval.call(this, this.state.paragraphs.output);
                } catch(e) {
                    checked_output = e.toString();
                };
                p.output = checked_output;
            }
            this.setState({paragraphs: p});
        }
    },
    codeChange: function(e) {
        this.setState(
            update(this.state, {
                paragraphs: { 
                    code: { $set: e.target.value }
                }
            })
        );
    },
    keyDown: function(e) {
        if (e.which == 13 & e.ctrlKey) {
            e.preventDefault();
            if (this.state.paragraphs.type == 'markdown') {
                console.log("keydown markdown code = " + this.state.paragraphs.code);
                this.setState(
                    update(this.state, {
                        paragraphs: { 
                            output: { $set: this.state.paragraphs.code }
                        }
                    })
                );
            }
            else if (this.state.paragraphs.type == 'react') {
                this.setState(
                    update(this.state, {
                        paragraphs: { 
                            output: { $set: this.state.paragraphs.code }
                        }
                    })
                );
            }
            else if (this.state.paragraphs.type == 'react-chart') {
                // var width = 700,
                //     height = 300,
                //     margins = {left: 100, right: 100, top: 50, bottom: 50},
                //     title = "User sample",
                //     chartSeries = [
                //         {
                //             field: 'BMI',
                //             name: 'BMI',
                //             color: '#ff7f0e'
                //         }
                //     ],
                //     chartData = [
                //       {
                //         name: "Lavon Hilll I",
                //         BMI: 20.57,
                //         age: 12,
                //         birthday: "1994-10-26T00:00:00.000Z",
                //         city: "Annatown",
                //         married: true,
                //         index: 1
                //       },
                //       {
                //         name: "Clovis Pagac",
                //         BMI: 24.28,
                //         age: 26,
                //         birthday: "1995-11-10T00:00:00.000Z",
                //         city: "South Eldredtown",
                //         married: false,
                //         index: 3
                //       },
                //       {
                //         name: "Gaylord Paucek",
                //         BMI: 24.41,
                //         age: 30,
                //         birthday: "1975-06-12T00:00:00.000Z",
                //         city: "Koeppchester",
                //         married: true,
                //         index: 5
                //       },
                //       {
                //         name: "Ashlynn Kuhn MD",
                //         BMI: 23.77,
                //         age: 32,
                //         birthday: "1985-08-09T00:00:00.000Z",
                //         city: "West Josiemouth",
                //         married: false,
                //         index: 6
                //       }
                //     ],
                //     x = function(d) {
                //         return d.index;
                //     }

                // output = <Chart
                //     title={title}
                //     width={width}
                //     height={height}
                //     margins= {margins}>
                //         <LineChart
                //             margins= {margins}
                //             title={title}
                //             data={chartData}
                //             width={width}
                //             height={height}
                //             chartSeries={chartSeries}
                //             x={x}/>
                //     </Chart>
                // this.setState(
                //     update(this.state, {
                //         paragraphs: { 
                //             output: { $set: output }
                //         }
                //     })
                // );
            }
            else if (this.state.paragraphs.type == 'code') {
                var msg = {id: this.props.paragraphId, type: 'code', content: this.state.paragraphs.code};
                Actions.sendMsgWS(this.state.paragraphs.id, msg).then(function() {
                    // signal that the message has been sent 
                    // and the server is processing the request
                    console.log("Message sent and under processing...");
                });
            }
        }
    },
    rawMarkup: function(html) {
        var rawMarkup = marked(
            html,
            {sanitize: true}
            );
        return {__html: rawMarkup};
    },
    render: function() {
        var p = null;
        // console.log(this.state);
        if (this.state.paragraphs.type == 'markdown') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
                        
                    </div>
                </div> 

        }
        else if (this.state.paragraphs.type == 'react') {
            var checked_output;
            try {
                checked_output = eval.call(this, this.state.paragraphs.output);
                // checked_output = eval.call(objectA, this.state.paragraph.output);
                // var jsCode = Babel.transform(this.state.paragraphs.output);
                // checked_output = eval(jsCode.code);
            } catch(e) {
                checked_output = e.toString();
            };
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{checked_output}</div>
                    </div>
                </div>
        }
        else if (this.state.paragraphs.type == 'react-chart') {
            // var checked_output;
            // try {
            //     checked_output = eval.call(this, this.state.paragraphs.output);
            //     // checked_output = eval.call(objectA, this.state.paragraph.output);
            //     // var jsCode = Babel.transform(this.state.paragraphs.output);
            //     // checked_output = eval(jsCode.code);
            // } catch(e) {
            //     checked_output = e.toString();
            // };
            console.log(this.state.paragraphs.output);
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{this.state.paragraphs.output}</div>
                    </div>
                </div>
        }
        else if (this.state.paragraphs.type == 'code') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
                    </div>
                </div> 
        }

        return p;
    }
});
