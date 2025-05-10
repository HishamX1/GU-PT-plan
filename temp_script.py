import json

# Read the original data.js content
with open("/home/ubuntu/digital_study_plan/data.js", "r") as f:
    content = f.read()

# Extract the courses array string (this is a bit fragile, assumes 'const courses = [' and ends with '];')
# A more robust solution would use a JS parser if available, but this should work for the given format.
start_index = content.find("const courses = [") + len("const courses = [")
end_index = content.rfind("];")
courses_str = content[start_index:end_index]

# Convert the JavaScript array string to a Python list of dictionaries
# This requires the string to be valid JSON-like. We might need to adjust if it's not.
# For now, assume it's close enough or can be massaged.
# A common issue is trailing commas, which are not allowed in JSON.
# Let's try to make it more JSON-compatible by replacing single quotes if any, and ensuring keys are quoted.
# However, the provided data.js uses double quotes for keys and string values, which is good.

# A simple way to handle this is to execute it as JS in a limited context if a full parser isn't available.
# For this task, let's assume a simpler string manipulation or manual edit if this programmatic approach is too complex for the LLM.
# Given the constraints, a direct modification might be too risky without a proper JS parser.

# Alternative: Modify the processCourseRelationships function to add tags: [] to each course.
# This is safer than trying to parse and rewrite the whole array string.

# Find the processCourseRelationships function
process_func_start = content.find("function processCourseRelationships()")
# Find the first forEach loop within that function where 'course' is defined
# courses.forEach(course => { course.requiredFor = []; });
# We can add course.tags = []; there.

insertion_point_str = "course.requiredFor = [];"
new_content_lines = []
added_tags_init = False
for line in content.splitlines():
    new_content_lines.append(line)
    if insertion_point_str in line and "forEach(course => {" in new_content_lines[-2]: # Check previous line for context
        indent = line.find(insertion_point_str)
        new_content_lines.append(" " * indent + "course.tags = []; // Initialize tags array")
        added_tags_init = True

if not added_tags_init:
    # Fallback: if the specific insertion point wasn't found, try a more general one
    # at the beginning of processCourseRelationships, or even before it for each course.
    # For now, let's assume the above works. If not, we'll need a different strategy.
    # A simpler approach: add it in the final loop of data.js
    final_loop_str = "courses.forEach(course => {"
    new_content_lines_fallback = []
    added_in_fallback = False
    for i, line in enumerate(content.splitlines()):
        new_content_lines_fallback.append(line)
        if final_loop_str in line and "course.totalSemesters = Math.max(...courses.map(c => c.semester));" in content.splitlines()[i+1]:
            indent = content.splitlines()[i+1].find("course.totalSemesters")
            new_content_lines_fallback.append(" " * indent + "course.tags = course.tags || []; // Initialize tags array if not present")
            added_in_fallback = True
            break # Add once
    if added_in_fallback:
        new_content_lines = new_content_lines_fallback
    else:
        # Last resort: append a new loop at the end of the file to add tags
        new_content_lines.append("\n// Ensure all courses have a tags property")
        new_content_lines.append("courses.forEach(course => {")
        new_content_lines.append("    if (!course.tags) {")
        new_content_lines.append("        course.tags = [];")
        new_content_lines.append("    }
        new_content_lines.append("});")

modified_content = "\n".join(new_content_lines)

with open("/home/ubuntu/digital_study_plan/data_modified.js", "w") as f:
    f.write(modified_content)

print("data.js has been processed to ensure 'tags' property exists. Check data_modified.js")

# This script is illustrative. A direct modification of data.js will be done by the agent using file_write or file_str_replace.
# The agent will read data.js, then write a new version with the tags added.
# The actual modification will be simpler: iterate through the courses array and add `tags: []` if not present.
# However, since I cannot execute complex JS parsing here, I will opt for a simpler modification strategy for data.js
# I will modify the `processCourseRelationships` function to add `course.tags = [];`
# Or, even better, modify the part where `totalSemesters` is added.

original_data_js_content = """
(Content of data.js - too long to include here, will be read by file_read)
"""

# Read data.js
# Add course.tags = []; in the loop: courses.forEach(course => { course.totalSemesters = ... });
# This is the safest place to add it without complex parsing.

# The actual modification will be done using file_str_replace on data.js
# Old string: course.totalSemesters = Math.max(...courses.map(c => c.semester));
# New string: course.tags = []; course.totalSemesters = Math.max(...courses.map(c => c.semester));
# This is a simple and effective way.

