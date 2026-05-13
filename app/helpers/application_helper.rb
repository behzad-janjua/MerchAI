module ApplicationHelper
  def money(value)
    "$#{format("%.4f", value.to_f)}"
  end

  def step_name(value)
    value.to_s.split("_").map(&:capitalize).join(" ")
  end

  def suggestion_for(listing)
    listing && listing["latestSuggestion"]
  end

  def score_class(score)
    return "" if score.nil?
    v = score.to_f
    if v >= 80 then "score--high"
    elsif v >= 60 then "score--mid"
    else "score--low"
    end
  end
end
