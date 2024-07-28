module.exports = grammar({
  name: "workflow",

  rules: {
    document: ($) => seq(optional($.name), optional($.on), $.jobs),

    name: ($) => seq("name:", $.identifier),

    on: ($) => seq("on:", repeat1($.event)),

    event: ($) => seq($.identifier, ":", $.event_details),

    event_details: ($) =>
      choice(
        seq("branches:", repeat1($.branch)),
        seq("tags:", repeat1($.tag)),
        seq("cron:", $.string),
        seq("inputs:", $.inputs),
        seq("types:", repeat1($.identifier)),
      ),

    branch: ($) => seq("-", $.identifier),

    tag: ($) => seq("-", $.identifier),

    inputs: ($) => repeat1($.input),

    input: ($) => seq($.identifier, ":", $.input_details),

    input_details: ($) =>
      seq(
        "description:",
        $.string,
        "required:",
        $.boolean,
        "default:",
        $.string,
        "type:",
        $.string,
      ),

    jobs: ($) => seq("jobs:", repeat1($.job)),

    job: ($) => seq($.identifier, ":", $.job_details),

    job_details: ($) => seq("settings:", $.settings, "tasks:", $.tasks),

    settings: ($) => repeat1($.setting_property),

    setting_property: ($) =>
      seq($.identifier, ":", choice($.boolean, $.integer, $.string)),

    tasks: ($) => repeat1($._task),

    _task: ($) =>
      choice(
        $.task,
        $.conditional_task,
        $.loop_task,
        $.parallel_task,
        $.wait_task,
        $.retry_task,
        $.meta_task,
      ),

    task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type:",
        $.identifier,
        optional($.dependencies),
        "config:",
        $.config,
      ),

    conditional_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: conditional",
        optional($.dependencies),
        "condition:",
        $.condition,
        "trueBranch:",
        $.true_branch,
        "falseBranch:",
        $.false_branch,
      ),

    condition: ($) =>
      seq(
        "type:",
        $.identifier,
        "filePath:",
        $.string,
        "operator:",
        $.identifier,
        "size:",
        $.string,
      ),

    true_branch: ($) => seq("tasks:", repeat1($._task)),

    false_branch: ($) => seq("tasks:", repeat1($._task)),

    loop_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: loop",
        optional($.dependencies),
        "condition:",
        $.loop_condition,
        "config:",
        $.loop_config,
        "task:",
        $.task,
      ),

    loop_condition: ($) => seq("type:", $.identifier),

    loop_config: ($) => seq("maxRetries:", $.integer),

    parallel_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: parallel",
        optional($.dependencies),
        "tasks:",
        repeat1($.task),
      ),

    wait_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: wait",
        optional($.dependencies),
        "config:",
        $.wait_config,
      ),

    wait_config: ($) => seq("duration:", $.string),

    retry_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: retry",
        optional($.dependencies),
        "config:",
        $.retry_config,
        "task:",
        $.task,
      ),

    retry_config: ($) => seq("maxRetries:", $.integer, "delay:", $.string),

    meta_task: ($) =>
      seq(
        "- id:",
        $.identifier,
        "type: meta",
        optional($.dependencies),
        "config:",
        $.meta_config,
      ),

    meta_config: ($) => seq("script:", $.string),

    dependencies: ($) => seq("dependencies:", repeat1($.dependency)),

    dependency: ($) => seq("-", $.identifier),

    config: ($) => repeat1($.config_property),

    config_property: ($) =>
      seq($.identifier, ":", choice($.string, $.boolean, $.integer, $.array)),

    array: ($) =>
      seq(
        "[",
        optional(
          seq(
            choice($.string, $.boolean, $.integer),
            repeat(seq(",", choice($.string, $.boolean, $.integer))),
          ),
        ),
        "]",
      ),

    identifier: ($) => /[a-zA-Z0-9_-]+/,
    string: ($) => /"[^"]*"/,
    boolean: ($) => choice("true", "false"),
    integer: ($) => /\d+/,
  },
});
