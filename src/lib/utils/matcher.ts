import minimatch from "minimatch";
import path from "path";

export function join(prefix: string, matcher: minimatch.IMinimatch): minimatch.IMinimatch {
  let result: minimatch.IMinimatch;

  if (matcher.comment || path.posix.isAbsolute(matcher.pattern)) {
    result = new minimatch.Minimatch(matcher.pattern);
  } else {
    result = new minimatch.Minimatch(path.posix.join(prefix, matcher.pattern), matcher.options);
  }

  result.negate = matcher.negate;

  return result;
}

export function relative(from: string, matcher: minimatch.IMinimatch): minimatch.IMinimatch {
  let result: minimatch.IMinimatch;

  if (matcher.comment) {
    result = new minimatch.Minimatch(matcher.pattern);
  } else {
    result = new minimatch.Minimatch(path.posix.relative(from, matcher.pattern), matcher.options);
  }

  result.negate = matcher.negate;

  return result;
}

export function asString(matcher: minimatch.IMinimatch): string {
  return (matcher.negate ? "!" : "") + matcher.pattern;
}
