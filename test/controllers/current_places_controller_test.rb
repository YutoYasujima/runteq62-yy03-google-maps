require "test_helper"

class CurrentPlacesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get current_places_index_url
    assert_response :success
  end
end
