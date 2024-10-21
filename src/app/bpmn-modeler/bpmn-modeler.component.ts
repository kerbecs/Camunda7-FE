import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import Modeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe.json';

import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';

import ElementTemplateIconRenderer from '@bpmn-io/element-template-icon-renderer';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule, CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

import './styles.css';
import {HttpClient} from "@angular/common/http";
import {CreateAppendAnythingModule, CreateAppendElementTemplatesModule} from "bpmn-js-create-append-anything";
import camundaModdlePackage from "camunda-bpmn-moddle/resources/camunda";

@Component({
  selector: 'app-bpmn-modeler',
  templateUrl: './bpmn-modeler.component.html',
  standalone: true,
  styleUrls: ['./bpmn-modeler.component.css']
})
export class BpmnModelerComponent implements AfterViewInit {
  private modeler!: Modeler;
  @ViewChild("container")
  private container! : ElementRef;

  private diagramXml: string = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                   id="_B0ppIPFYEeOlke_H2tkzCA"
                   targetNamespace="http://camunda.org/examples">
  <bpmn2:process id="process_id" name="My Process" isExecutable="true">
    <bpmn2:startEvent id="start_event_id" name="Start Event">
      <bpmn2:outgoing>flow_id</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="service_task_id" name="Service Task" camunda:class="your.service.class">
      <bpmn2:incoming>flow_id</bpmn2:incoming>
      <bpmn2:outgoing>end_flow_id</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="end_event_id" name="End Event">
      <bpmn2:incoming>end_flow_id</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="flow_id" sourceRef="start_event_id" targetRef="service_task_id"/>
    <bpmn2:sequenceFlow id="end_flow_id" sourceRef="service_task_id" targetRef="end_event_id"/>
  </bpmn2:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_process_id">
    <bpmndi:BPMNPlane bpmnElement="process_id">
      <bpmndi:BPMNShape bpmnElement="start_event_id" id="BPMNShape_start_event_id">
        <dc:Bounds x="100" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="service_task_id" id="BPMNShape_service_task_id">
        <dc:Bounds x="200" y="100" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="end_event_id" id="BPMNShape_end_event_id">
        <dc:Bounds x="350" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="flow_id" id="BPMNEdge_flow_id">
        <di:waypoint x="136" y="118"/>
        <di:waypoint x="200" y="118"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="end_flow_id" id="BPMNEdge_end_flow_id">
        <di:waypoint x="300" y="118"/>
        <di:waypoint x="350" y="118"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>

  `;

  constructor(private http : HttpClient) {
  }

  ngAfterViewInit(): void {
    if (this.modeler) {
      this.modeler.destroy();
    }
    const container = this.container.nativeElement;

    this.modeler = new Modeler({
      container,
      keyboard: {
        bindTo: document
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ConnectorsExtensionModule,
        ElementTemplateIconRenderer,
        ElementTemplateChooserModule,
        CreateAppendAnythingModule,
        CreateAppendElementTemplatesModule,
      ],
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      propertiesPanel: {
        parent: '#properties-panel-container'
      }
    });

    this.modeler
      .importXML(this.diagramXml)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.log('Warnings during import:', warnings);
        }

        const canvas = this.modeler.get("canvas");
        // @ts-ignore
        canvas.zoom("fit-viewport");
      })
      .catch((err) => {
        console.error('Error during import:', err);
      });

    this.loadElementTemplates();
  }

  private loadElementTemplates(): void {
    const templates = []
    this.http.get('assets/slack.json').subscribe((templates) => {
      // @ts-ignore
      this.modeler.get('elementTemplates').set(templates);
    });
    this.http.get('assets/another-rest.json').subscribe((templates) => {
      // @ts-ignore
      this.modeler.get('elementTemplates').set(templates);
    });
  }
  exportXml(): void {
    this.modeler.saveXML({ format: true }).then((result) => {
      const exportedXml = result.xml; // Actualizează variabila care conține XML-ul exportat
      console.log(exportedXml)
    }).catch((err) => {
      console.error('Failed to export XML', err);
    });
  }
}
