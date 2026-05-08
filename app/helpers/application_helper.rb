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
end
