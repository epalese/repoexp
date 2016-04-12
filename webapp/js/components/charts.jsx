import React    from 'react';
import d3       from 'd3';

let Chart = React.createClass({
    render: function() {
        return (
             <svg width={this.props.width} 
                 height={this.props.height} >
              {this.props.children}
            </svg> 
        );
    }
});

let Bar = React.createClass({
  getDefaultProps: function() {
    return {
      data: [],
      x_axis: undefined,
      y_axis: undefined
    }
  },

  shouldComponentUpdate: function(nextProps) {
      return this.props.data !== nextProps.data;
  },

    render: function() {
        var props = this.props;
        var data = props.data.map(function(d) {
            console.log("inside Bar.shouldComponentUpdate.render: " + d[props.y_axis]);
            return d[props.y_axis];
        });

    var yScale = d3.scale.linear()
      .domain([0, d3.max(data)])
      .range([0, this.props.height]);

    var xScale = d3.scale.ordinal()
      .domain(d3.range(this.props.data.length))
      .rangeRoundBands([0, this.props.width], 0.05);

    var bars = data.map(function(point, i) {
      var height = yScale(point),
          y = props.height - height,
          width = xScale.rangeBand(),
          x = xScale(i);

      return (
        <Rect height={height} 
              width={width} 
              x={x} 
              y={y} 
              key={i} />
      )
    });

    return (
          <g>{bars}</g>
    );
  }
});

let Rect = React.createClass({
    getDefaultProps: function() {
        return {
            width: 0,
            height: 0,
            x: 0,
            y: 0
        }
    },

    shouldComponentUpdate: function(nextProps) {
      return this.props.height !== nextProps.height;
    },

    render: function() {
        console.log("Rect: ");
        console.log(this.props);
        return (
          <rect className="bar"
                height={this.props.height} 
                y={this.props.y} 
                width={this.props.width}
                x={this.props.x}
          >
          </rect>
        );
    },
});

export {Chart, Bar, Rect};