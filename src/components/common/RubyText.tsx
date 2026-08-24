import type { RubySegment } from "../../types";

interface RubyTextProps {
    text: string;
    ruby?: RubySegment[];
}

/** Renders text with inline reading-aid annotations (furigana for Japanese, pinyin for Mandarin) using native <ruby>/<rt>. Falls back to plain text when no ruby data is present. */
export function RubyText({ text, ruby }: RubyTextProps) {
    if (!ruby || ruby.length === 0) return <>{text}</>>
  
    return (
          <>
            {ruby.map((segment, index) =>
                    segment.reading ? (
                                <ruby key={index}>
                                  {segment.base}
                                            <rt className="text-[0.55em] text-muted-foreground">{segment.reading}</rt>
                                </ruby>
                              ) : (
                                <span key={index}>{segment.base}</span>
                              ),
                            )}
          </>
        );
}
