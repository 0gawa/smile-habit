require 'rails_helper'

RSpec.describe SmileAnalysisService, type: :service do
  let(:image_file) { double('image_file', path: 'spec/fixtures/smile.jpg') }
  let(:service) { SmileAnalysisService.new(image_file) }
  let(:vision_client) { instance_double(Google::Cloud::Vision::V1::ImageAnnotator::Client) }
  let(:face_annotation) { double('face_annotation') }
  let(:response) { double('response', responses: [double('first_response', face_annotations: [face_annotation], error: nil)]) }

  before do
    allow(Google::Cloud::Vision::V1::ImageAnnotator::Client).to receive(:new).and_return(vision_client)
    allow(vision_client).to receive(:face_detection).and_return(response)
  end

  describe '#call' do
    context 'when a face is detected' do
      before do
        allow(face_annotation).to receive(:detection_confidence).and_return(0.9)
        allow(face_annotation).to receive(:landmarking_confidence).and_return(0.9)
      end

      it 'returns a hash with scores' do
        allow(face_annotation).to receive(:joy_likelihood).and_return(:VERY_LIKELY)
        allow(face_annotation).to receive(:anger_likelihood).and_return(:VERY_UNLIKELY)
        allow(face_annotation).to receive(:roll_angle).and_return(0)
        allow(face_annotation).to receive(:landmarks).and_return([])

        scores = service.call
        expect(scores).to be_a(Hash)
        expect(scores).to have_key(:overall_score)
      end

      it 'returns a higher score for a more genuine smile' do
        face_annotation_1 = double('face_annotation',
                                   joy_likelihood: :LIKELY,
                                   anger_likelihood: :VERY_UNLIKELY,
                                   roll_angle: 0,
                                   detection_confidence: 0.9,
                                   landmarking_confidence: 0.9,
                                   landmarks: [
                                     double('landmark', type: :MOUTH_LEFT, position: double('position', y: 10)),
                                     double('landmark', type: :MOUTH_RIGHT, position: double('position', y: 10)),
                                     double('landmark', type: :UPPER_LIP, position: double('position', y: 5)),
                                     double('landmark', type: :LOWER_LIP, position: double('position', y: 15))
                                   ])

        face_annotation_2 = double('face_annotation',
                                   joy_likelihood: :LIKELY,
                                   anger_likelihood: :VERY_UNLIKELY,
                                   roll_angle: 0,
                                   detection_confidence: 0.9,
                                   landmarking_confidence: 0.9,
                                   landmarks: [
                                      double('landmark', type: :MOUTH_LEFT, position: double('position', y: 10)),
                                      double('landmark', type: :MOUTH_RIGHT, position: double('position', y: 10)),
                                      double('landmark', type: :UPPER_LIP, position: double('position', y: 5)),
                                      double('landmark', type: :LOWER_LIP, position: double('position', y: 15)),
                                      double('landmark', type: :LEFT_EYE_TOP_BOUNDARY, position: double('position', y: 0)),
                                      double('landmark', type: :LEFT_EYE_BOTTOM_BOUNDARY, position: double('position', y: 2))
                                   ])

        response_1 = double('response', responses: [double('first_response', face_annotations: [face_annotation_1], error: nil)])
        allow(vision_client).to receive(:face_detection).and_return(response_1)
        scores_1 = service.call

        response_2 = double('response', responses: [double('first_response', face_annotations: [face_annotation_2], error: nil)])
        allow(vision_client).to receive(:face_detection).and_return(response_2)
        scores_2 = service.call

        expect(scores_2[:overall_score]).to be > scores_1[:overall_score]
      end
    end

    context 'when no face is detected' do
      it 'returns an empty hash' do
        allow(response.responses.first).to receive(:face_annotations).and_return([])
        scores = service.call
        expect(scores).to eq({})
      end
    end
  end
end
