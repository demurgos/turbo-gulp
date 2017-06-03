import {IMinimatch, Minimatch} from "minimatch";
import {posix as path} from "path";

export function join(prefix: string, matcher: IMinimatch): IMinimatch {
  let result: IMinimatch;

  if (matcher.comment || path.isAbsolute(matcher.pattern)) {
    result = new Minimatch(matcher.pattern);
  } else {
    result = new Minimatch(path.join(prefix, matcher.pattern), matcher.options);
  }

  result.negate = matcher.negate;

  return result;
}

export function relative(from: string, matcher: IMinimatch): IMinimatch {
  let result: IMinimatch;

  if (matcher.comment) {
    result = new Minimatch(matcher.pattern);
  } else {
    result = new Minimatch(path.relative(from, matcher.pattern), matcher.options);
  }

  result.negate = matcher.negate;

  return result;
}

export function asString(matcher: IMinimatch): string {
  return (matcher.negate ? "!" : "") + matcher.pattern;
}
